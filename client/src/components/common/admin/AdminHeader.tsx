import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { FaHome } from "react-icons/fa";
import { IoLogOutOutline, IoNotifications, IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import axios from "../../../api/axios";

const cookies = new Cookies();

const AdminHeader = () => {
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState<number>(1);
    const [show, setShow] = useState<boolean>(false);
    const uid =
        cookies.get("rememberMe")?.uid ||
        (sessionStorage["rememberMe"]
            ? JSON.parse(sessionStorage["rememberMe"]).uid
            : "");
    const handleClick = () => {
        setShow(true);
    };
    const handleClose = () => {
        setShow(false);
    };
    const handleLogout = async () => {
        try {
            sessionStorage.removeItem("rememberMe");
            cookies.remove("rememberMe");
            navigate("/login");
            // const response = await axios.post("/api/users/logout", { uid });
            // if (response.status === 200) {
            // }
        } catch (err) {
            throw err;
        }
    };

    return (
        <div className="admin__layout__main__header">
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "2rem",
                    justifyContent: "center",
                }}
            >
                <div>
                    <button type="button">
                        <FaHome />
                        Home
                    </button>
                </div>
                <div className="admin__layout__main__header__search">
                    <input type="text" placeholder="Search..." />

                    <button type="submit">
                        <IoSearch size={20} />
                    </button>
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "0.5rem",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <div className="admin__layout__main__header__notifications">
                    <IoNotifications
                        size={28}
                        className="admin__layout__main__header__notifications__icon"
                    />
                    {unreadCount > 0 && (
                        <span className="admin__layout__main__header__notifications__badge">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <button onClick={() => handleClick()}>
                    LOGOUT
                    <IoLogOutOutline size={20} />
                </button>
            </div>
            <Modal show={show} onHide={handleClose} animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Logout</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure to logout?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleLogout}>
                        Logout
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminHeader;