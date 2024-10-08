import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import CartPage from "../components/pages/CartPage";
import ToastProvider from "../context/ToastContext";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import CheckoutPaymentPage from "../components/pages/CheckoutPaymentPage";

jest.mock("../api/axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock("../context/AuthContext", () => ({
    useAuth: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"), // Nếu có các hàm khác cần giữ nguyên
    useNavigate: jest.fn(), // Mock useNavigate
}));
describe("CartPage", () => {
    const mockCartItems = [
        {
            cart_item_id: 1,
            product_id: 1,
            product_name: "Apple",
            category: "Electronics",
            brand: "Brand 1",
            price: 100,
            main_image: "/images/product1.jpg",
            quantity: 2,
        },
        {
            cart_item_id: 2,
            product_id: 2,
            product_name: "Gucci",
            category: "Fashion",
            brand: "Brand 2",
            price: 200,
            main_image: "/images/product2.jpg",
            quantity: 1,
        },
    ];

    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should match the CartPage snapshot", async () => {
        (useAuth as jest.Mock).mockReturnValue({
            uid: "12345", // Mocked uid
            userData: null,
            loading: false,
        });
        const { asFragment } = render(
            <ToastProvider>
                <MemoryRouter>
                    <CartPage />
                </MemoryRouter>
            </ToastProvider>
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render cart items correctly", () => {
        (useAuth as jest.Mock).mockReturnValue({
            uid: "12345", // Mocked uid
            userData: null,
            loading: false,
        });
        render(
            <ToastProvider>
                <MemoryRouter>
                    <CartPage />
                </MemoryRouter>
            </ToastProvider>
        );
        expect(screen.getByText(/Free delivery for 1-2 days/i)).toBeInTheDocument();
        expect(screen.getByText(/Make Purchase/i)).toBeInTheDocument();
        expect(screen.getByText(/Total price:/i)).toBeInTheDocument();
    });

    it("should render cart items when uid is available", async () => {
        // Mock the return value of useAuth
        (useAuth as jest.Mock).mockReturnValue({
            uid: "12345", // Mocked uid
            userData: null,
            loading: false,
        });
        // Mock axios.get response
        mockedAxios.get.mockImplementationOnce(() => {
            return Promise.resolve({
                status: 200,
                data: { cartItems: mockCartItems, msg: "Products are fetched successfully" },
            });
        });

        render(
            <ToastProvider>
                <MemoryRouter>
                    <CartPage />
                </MemoryRouter>
            </ToastProvider>
        );

        // Use waitFor to wait for the asynchronous effect to complete
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith("/api/cart/12345");
        });
        await waitFor(() => {
            expect(screen.getByText(/apple/i)).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.getAllByText(/400.00/i)[0]).toBeInTheDocument();
        });
    });

    it('should navigate to "/" when "Continue Shopping" button is clicked', () => {
        // Mock the navigate function
        (useAuth as jest.Mock).mockReturnValue({
            uid: "12345", // Mocked uid
            userData: null,
            loading: false,
        });
        const mockNavigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
        // Render the component
        render(
            <ToastProvider>
                <MemoryRouter initialEntries={["/shops", "/"]}>
                    <CartPage />
                </MemoryRouter>
            </ToastProvider>
        );

        const continueButton = screen.getByText(/continue shopping/i);
        fireEvent.click(continueButton);
        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("should remove the product when click on Remove button", async () => {
        // Mock the navigate function
        (useAuth as jest.Mock).mockReturnValue({
            uid: "12345", // Mocked uid
            userData: null,
            loading: false,
        });
        mockedAxios.get.mockImplementationOnce(() => {
            return Promise.resolve({
                status: 200,
                data: { cartItems: mockCartItems, msg: "Products are fetched successfully" },
            });
        });

        render(
            <ToastProvider>
                <MemoryRouter>
                    <CartPage />
                </MemoryRouter>
            </ToastProvider>
        );

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith("/api/cart/12345");
        });

        await waitFor(() => {
            expect(screen.getByText(/apple/i)).toBeInTheDocument();
        });
        const removeButton = screen.getAllByText(/remove/i)[0];
        expect(removeButton).toBeInTheDocument();
        fireEvent.click(removeButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("/api/cart/delete", { cartItemId: 1 });
        });
    });

    it("should apply discount correctly", async () => {
        // Mock the navigate function
        const couponCode = "SUMMER10";
        (useAuth as jest.Mock).mockReturnValue({
            uid: "12345", // Mocked uid
            userData: null,
            loading: false,
        });
        mockedAxios.get.mockImplementationOnce(() => {
            return Promise.resolve({
                status: 200,
                data: { cartItems: mockCartItems, msg: "Products are fetched successfully" },
            });
        });
        mockedAxios.post.mockImplementationOnce(() => {
            return Promise.resolve({
                status: 200,
                data: { newPrice: 200, msg: "Products are fetched successfully" },
            });
        });

        render(
            <ToastProvider>
                <MemoryRouter>
                    <CartPage />
                </MemoryRouter>
            </ToastProvider>
        );

        const couponInput = screen.getByTestId("coupon");
        const applyButton = screen.getByText(/apply/i);
        expect(couponInput).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getAllByText(/400.00/i)[0]).toBeInTheDocument();
        });
        fireEvent.change(couponInput, { target: { value: couponCode } });
        expect(couponInput).toHaveValue(couponCode);
        fireEvent.click(applyButton);
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("/api/discount", {
                discountCode: couponCode,
                price: 400,
            });
        });
        await waitFor(() => {
            expect(screen.getAllByText(/200.00/i)[0]).toBeInTheDocument();
        });
    });

    it("should handle discount not found", async () => {
        (useAuth as jest.Mock).mockReturnValue({
            uid: "12345", // Mocked uid
            userData: null,
            loading: false,
        });
        mockedAxios.get.mockImplementationOnce(() => {
            return Promise.resolve({
                status: 200,
                data: { cartItems: mockCartItems, msg: "Products are fetched successfully" },
            });
        });
        mockedAxios.post.mockImplementationOnce(() => {
            return Promise.resolve({
                status: 204,
                data: { msg: "Discount not found" },
            });
        });

        render(
            <ToastProvider>
                <MemoryRouter>
                    <CartPage />
                </MemoryRouter>
            </ToastProvider>
        );

        const couponInput = screen.getByTestId("coupon");
        const applyButton = screen.getByText(/apply/i);
        expect(couponInput).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getAllByText(/400.00/i)[0]).toBeInTheDocument();
        });
        fireEvent.change(couponInput, { target: { value: "INVALID_CODE" } });
        fireEvent.click(applyButton);
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("/api/discount", {
                discountCode: "INVALID_CODE",
                price: 400,
            });
        });
        await waitFor(() => {
            expect(screen.getByText("Discount not found")).toBeInTheDocument();
        });
    });

    it("should navigate checkout page when click Make purchase", async () => {
        // Mock the navigate function
        (useAuth as jest.Mock).mockReturnValue({
            uid: "12345", // Mocked uid
            userData: null,
            loading: false,
        });
        mockedAxios.get.mockImplementationOnce(() => {
            return Promise.resolve({
                status: 200,
                data: { cartItems: mockCartItems, msg: "Products are fetched successfully" },
            });
        });

        render(
            <ToastProvider>
                <MemoryRouter initialEntries={["/cart"]}>
                    <CartPage />
                    <CheckoutPaymentPage
                        setIsPayment={() => {}}
                        cart={[]}
                        totalPrice={400}
                        discount={0}
                        subtotal={400}
                    />
                </MemoryRouter>
            </ToastProvider>
        );

        const makePurchaseButton = screen.getByRole("button", { name: "Make purchase" });
        expect(makePurchaseButton).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getAllByText(/400.00/i)[0]).toBeInTheDocument();
        });
        fireEvent.click(makePurchaseButton);
        await waitFor(() => {
            expect(screen.getByText(/Purchase Confirmation/i)).toBeInTheDocument();
        });
        const confirmButton = screen.getByRole("button", { name: /confirm/i });
        expect(confirmButton).toBeInTheDocument();
        fireEvent.click(makePurchaseButton);
        await waitFor(() => {
            expect(screen.getByText(/checkout payment/i)).toBeInTheDocument();
        });
    });
});
