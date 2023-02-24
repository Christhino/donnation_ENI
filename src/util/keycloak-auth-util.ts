import nodeFetch from 'node-fetch';

export interface KeycloakProfile {
    id: string;
    displayName: string;
    name: {
        familyName: string;
        givenName: string;
    };
    emails: [{ value: string }];
    _json: {
        sub: string;
        email: string;
        email_verified: boolean;
        preferred_username: string;
        name: string;
        given_name: string;
        family_name: string;
    };
}


export const userProfile = async (accessTokenOrRequest: string | any): Promise<KeycloakProfile | undefined> => {

    const accessToken = typeof accessTokenOrRequest === 'string' ?
        accessTokenOrRequest : accessTokenOrRequest.headers?.authorization?.split(' ')?.[1];

    if (!accessToken) {
        return undefined
    }


    try {
        const url = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`
        
        let response = await nodeFetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        let data: KeycloakProfile["_json"] = (await response.json()) as any;

        if((data as any)?.error){
            return undefined
        }

        let profile: KeycloakProfile = {
            displayName: data.name || data.preferred_username,
            id: data.sub,
            name: {
                familyName: data.family_name,
                givenName: data.given_name,
            },
            emails: [{ value: data.email }],
            _json: data,
        };

        return profile;
    }
    catch (error) {
        console.log(`[userProfile] userProfile error`,error,accessToken)

        return undefined
    }

}