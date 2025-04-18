import React, { useState, useEffect } from 'react';
import './LocalContactPicker.css';

const ContactPickerForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        email: '',
        tel: '',
    });

    const [error, setError] = useState('');
    const [isContactPickerSupported, setIsContactPickerSupported] = useState(false);

    useEffect(() => {
        if ('contacts' in navigator) {
            setIsContactPickerSupported(true);
        }
    }, []);

    const handlePickContact = async () => {
        const props = ['name', 'email', 'tel', 'address'];
        const opts = { multiple: false };

        try {
            //@ts-expect-error
            const [contact] = await navigator.contacts.select(props, opts);
            if (contact) {
                setFormData({
                    name: contact.name ?? '',
                    address: contact.address ?? '',
                    email: contact.email ?? '',
                    tel: contact.tel ?? '',
                });
            }
        } catch (err) {
            //@ts-expect-error
            setError(`${err.name}: ${err.message}`);
        }
    };

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="contact-form">
            {isContactPickerSupported && (
                <button onClick={handlePickContact}>Pick a Contact</button>
            )}

            <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter name"
                />
            </div>

            <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                    id="address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                />
            </div>

            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                />
            </div>

            <div className="form-group">
                <label htmlFor="tel">Phone</label>
                <input
                    id="tel"
                    type="tel"
                    name="tel"
                    value={formData.tel}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                />
            </div>

            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default ContactPickerForm;