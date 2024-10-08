import React from "react";
import "../../styles/ContactUsPage.scss";
import Layout from "../layout/Layout";
import NavigationBar from "../common/NavigationBar";
import { Helmet } from "react-helmet";

const ContactUsPage: React.FC = () => {
    return (
        <Layout>
            <NavigationBar />
            <Helmet>
                <title>Contact us</title>
            </Helmet>
            <main className="contact-us">
                <section className="contact-us__container">
                    <h1 className="contact-us__title">Contact Us</h1>
                    <p className="contact-us__description">
                        Have any questions or concerns? We're always ready to help! Reach out to us through any of the
                        following methods, and we will get back to you as soon as possible.
                    </p>

                    <div className="contact-us__info">
                        <section className="contact-us__section">
                            <h2>Email Us</h2>
                            <address>
                                <p>support@digital-e.com</p>
                            </address>
                        </section>

                        <section className="contact-us__section">
                            <h2>Call Us</h2>
                            <address>
                                <p>+84 123 456 789</p>
                            </address>
                        </section>

                        <section className="contact-us__section">
                            <h2>Visit Us</h2>
                            <address>
                                <p>123 ABC Street Ho Chi Minh City, Vietnam</p>
                            </address>
                        </section>
                    </div>
                </section>
            </main>
        </Layout>
    );
};

export default ContactUsPage;
