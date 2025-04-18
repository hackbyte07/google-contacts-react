import React, { useEffect, useState } from 'react';
import './GoogleContacts.css';

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}



const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/people/v1/rest';
const SCOPES = 'https://www.googleapis.com/auth/contacts.readonly';

const GoogleContacts: React.FC = () => {
    const [gapiInited, setGapiInited] = useState(false);
    const [gisInited, setGisInited] = useState(false);
    const [tokenClient, setTokenClient] = useState<any>(null);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [contactsData, setContactsData] = useState<Partial<ContactsData>[] | null>([]);

    console.log(contactsData, 'haha')

    useEffect(() => {
        const loadScript = (src: string, onLoad: () => void) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.defer = true;
            script.onload = onLoad;
            document.body.appendChild(script);
        };

        loadScript('https://apis.google.com/js/api.js', gapiLoaded);
        loadScript('https://accounts.google.com/gsi/client', gisLoaded);
    }, []);

    const gapiLoaded = () => {
        window.gapi.load('client', async () => {
            await window.gapi.client.init({
                apiKey: import.meta.env.VITE_API_KEY,
                discoveryDocs: [DISCOVERY_DOC],
            });
            setGapiInited(true);
        });
    };

    // GIS initialization
    const gisLoaded = () => {
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_CLIENT_ID,
            scope: SCOPES,
            callback: () => { }, // will be assigned on auth
        });
        setTokenClient(client);
        setGisInited(true);
    };

    const readyToAuthorize = gapiInited && gisInited && tokenClient;

    const handleAuthClick = () => {
        tokenClient.callback = async (resp: any) => {
            if (resp.error) {
                console.error('Auth Error:', resp);
                return;
            }
            setIsSignedIn(true);
            await fetchAllContacts();
        };

        const token = window.gapi.client.getToken();
        if (!token) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            tokenClient.requestAccessToken({ prompt: '' });
        }
    };

    const handleSignoutClick = () => {
        const token = window.gapi.client.getToken();
        if (token) {
            window.google.accounts.oauth2.revoke(token.access_token);
            window.gapi.client.setToken('');
            setIsSignedIn(false);
            setContactsData([]);
        }
    };

    const fetchAllContacts = async () => {
        try {
            const response = await window.gapi.client.people.people.connections.list({
                resourceName: 'people/me',
                pageSize: 100,
                personFields: 'names,emailAddresses,phoneNumbers,addresses,organizations,photos,biographies,birthdays,genders,urls,userDefined',
            });

            const connections = response.result.connections;
            if (!connections || connections.length === 0) {
                setContactsData([]);
                return;
            }

            setContactsData(connections);
        } catch (err: any) {
            console.error('Error fetching contacts:', err);
            setContactsData([]);
        }
    };

    return (
        <div className="google-contacts-container">
            <div className="auth-buttons">
                {readyToAuthorize && (
                    <button 
                        className={`auth-button ${isSignedIn ? 'refresh' : 'authorize'}`}
                        onClick={handleAuthClick}
                    >
                        {isSignedIn ? 'Refresh' : 'Authorize'}
                    </button>
                )}
                {isSignedIn && (
                    <button 
                        className="auth-button signout"
                        onClick={handleSignoutClick}
                    >
                        Sign Out
                    </button>
                )}
            </div>
            
            <div className="contacts-grid">
                {contactsData && contactsData.map((user, index) => (
                    <div key={index} className="contact-card">
                        <div className="contact-header">
                            {user.photos?.[0]?.url ? (
                                <img 
                                    src={user.photos[0].url} 
                                    alt={user.names?.[0]?.displayName || 'Contact'} 
                                    className="contact-photo"
                                />
                            ) : (
                                <div className="contact-photo-placeholder">
                                    {user.names?.[0]?.displayName?.[0] || '?'}
                                </div>
                            )}
                            <h3 className="contact-name">
                                {user.names?.[0]?.displayName || 'Unnamed Contact'}
                            </h3>
                        </div>
                        
                        <div className="contact-details">
                            {user.emailAddresses && user.emailAddresses.length > 0 && (
                                <div className="contact-info">
                                    <span className="info-label">Email:</span>
                                    <span className="info-value">
                                        {user.emailAddresses[0].value}
                                    </span>
                                </div>
                            )}

                            {user.phoneNumbers && user.phoneNumbers.length > 0 && (
                                <div className="contact-info">
                                    <span className="info-label">Phone:</span>
                                    <span className="info-value">
                                        {user.phoneNumbers[0].value}
                                    </span>
                                </div>
                            )}

                            {user.organizations && user.organizations.length > 0 && (
                                <div className="contact-info">
                                    <span className="info-label">Organization:</span>
                                    <span className="info-value">
                                        {user.organizations[0].name}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export interface ContactsData {
    resourceName: string;
    etag: string;
    names?: (NamesEntity)[] | null;
    photos?: (PhotosEntity)[] | null;
    birthdays?: (BirthdaysEntity)[] | null;
    emailAddresses?: (EmailAddressesEntity)[] | null;
    phoneNumbers?: (PhoneNumbersEntity)[] | null;
    organizations?: (OrganizationsEntity)[] | null;
}
export interface NamesEntity {
    metadata: Metadata;
    displayName: string;
    familyName: string;
    givenName: string;
    displayNameLastFirst: string;
    unstructuredName: string;
}
export interface Metadata {
    primary: boolean;
    source: Source;
    sourcePrimary: boolean;
}
export interface Source {
    type: string;
    id: string;
}
export interface PhotosEntity {
    metadata: Metadata1;
    url: string;
    default?: boolean | null;
}
export interface Metadata1 {
    primary?: boolean | null;
    source: Source;
}
export interface BirthdaysEntity {
    metadata: Metadata2;
    date: Date;
}
export interface Metadata2 {
    primary: boolean;
    source: Source;
}
export interface Date {
    month: number;
    day: number;
}
export interface EmailAddressesEntity {
    metadata: Metadata1;
    value: string;
}
export interface PhoneNumbersEntity {
    metadata: Metadata2;
    value: string;
    canonicalForm: string;
}
export interface OrganizationsEntity {
    metadata: Metadata2;
    name: string;
    title: string;
}


export default GoogleContacts;