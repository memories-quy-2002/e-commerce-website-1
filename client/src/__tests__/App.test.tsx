import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import AdminDashboard from "../components/pages/admin/AdminDashboard";
import HomePage from "../components/pages/HomePage";
import ToastProvider from "../context/ToastContext";
import NoPage from "../components/pages/NoPage";
import ShopsPage from "../components/pages/ShopsPage";
import { useAuth } from "../context/AuthContext";
import { Role } from "../utils/interface";
import axios from "../api/axios";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

jest.mock("../context/AuthContext");
jest.mock("../api/axios");
jest.mock("firebase/auth", () => ({
    getAuth: jest.fn(),
    signOut: jest.fn(),
}));
const mockUseAuth = useAuth as jest.Mock;
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("App", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuth.mockReturnValue({
            uid: "12345", // Mocked uid
            userData: {
                id: "12345",
                username: "customer1",
                email: "johndoe@example.com",
                role: Role.Customer,
                created_at: new Date("2024-09-15"),
                last_login: new Date("2024-09-15"),
            },
            loading: false,
        });
    });
    it("matches the App snapshot", () => {
        const { asFragment } = render(
            <ToastProvider>
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            </ToastProvider>
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders HomePage component on default route", async () => {
        render(
            <ToastProvider>
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            </ToastProvider>
        );

        // Assert that HomePage content is displayed
        await waitFor(() => {
            expect(screen.getByText(/Explore Our Latest Devices/i)).toBeInTheDocument();
        });
    });

    it("should display NotFoundPage for an invalid route", async () => {
        render(
            <MemoryRouter initialEntries={["/invalid-route"]}>
                <NoPage />
            </MemoryRouter>
        );

        // Assert that NotFoundPage is rendered
        await waitFor(() => {
            expect(screen.getByText(/404 Error/i)).toBeInTheDocument();
        });
    });

    it("redirects unauthenticated user from protected routes", () => {
        render(
            <ToastProvider>
                <BrowserRouter>
                    <AdminDashboard />
                </BrowserRouter>
            </ToastProvider>
        );

        let link = screen.getAllByText(/Dashboard/i)[0] as HTMLAnchorElement;
        expect(link).toBeInTheDocument();
        expect(screen.getByText(/Download Report/i)).toBeInTheDocument();
        expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
    });

    it("should navigate between pages correctly", async () => {
        render(
            <ToastProvider>
                <MemoryRouter initialEntries={["/", "/shops"]}>
                    <HomePage />
                    <ShopsPage />
                </MemoryRouter>
            </ToastProvider>
        );

        // Assert HomePage is initially displayed
        await waitFor(() => {
            expect(screen.getByText(/Explore Our Latest Devices/i)).toBeInTheDocument();
        });

        const viewAllLink = screen.getByRole("link", { name: "View all" });
        expect(viewAllLink).toBeInTheDocument();
        expect(viewAllLink).toHaveAttribute("href", "/shops");
        fireEvent.click(viewAllLink);

        await waitFor(() => {
            expect(screen.getByText(/SHOPS PRODUCTS/i)).toBeInTheDocument();
        });
    });

    it("should logout successfully", async () => {
        Object.defineProperty(window, "location", {
            configurable: true,
            value: { reload: jest.fn() },
        });

        const reloadFn = () => {
            window.location.reload();
        };
        mockedAxios.post.mockImplementationOnce(() => {
            return Promise.resolve({
                status: 200,
                data: {
                    userData: {
                        id: "12345",
                        username: "customer1",
                        email: "johndoe@example.com",
                        role: Role.Customer,
                        created_at: new Date("2024-09-15"),
                        last_login: new Date("2024-09-15"),
                    },
                    msg: "User logged out successfully",
                },
            });
        });
        render(
            <ToastProvider>
                <MemoryRouter>
                    <HomePage />
                </MemoryRouter>
            </ToastProvider>
        );

        await waitFor(() => {
            expect(screen.getByText(/customer1/i)).toBeInTheDocument();
        });

        const logoutButton = screen.getByRole("link", { name: /logout/i });
        fireEvent.click(logoutButton);

        mockUseAuth.mockReturnValue({
            uid: null,
            userData: null,
            loading: false,
        });

        // Chờ đợi và kiểm tra API gọi đúng cách
        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith("/api/users/logout");
        });

        // Kiểm tra firebase signOut được gọi
        expect(signOut).toHaveBeenCalledWith(auth);

        reloadFn();
        expect(window.location.reload).toHaveBeenCalled();
    });
});
