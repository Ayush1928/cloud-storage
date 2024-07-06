import { NextResponse } from "next/server";
import jwksClient from "jwks-rsa";
import jwt, { JwtPayload } from "jsonwebtoken";
import axios from "axios";

interface KindeEvent extends JwtPayload {
    type: string;
    data: any; // You might want to define a more specific type for `data`
}

// The Kinde issuer URL should already be in your `.env` file
// from when you initially set up Kinde. This will fetch your
// public JSON web keys file
const client = jwksClient({
    jwksUri: `${process.env.KINDE_ISSUER_URL}/.well-known/jwks.json`,
});

const createContainer = async (id: string) => {
    const data = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/container/create`, {
        body: {
            id: id.toLowerCase().replace(/[^a-z0-9-]/g, '')
        }
    })
    console.log("Container created : ", id);
    console.log(data.data);
}

export async function POST(req: Request) {
    try {
        // Get the token from the request
        const token = await req.text();

        // Decode the token
        const decoded = jwt.decode(token, { complete: true });
        if (!decoded || typeof decoded === 'string') {
            throw new Error('Invalid token');
        }

        const { header } = decoded;
        const kid = header.kid;

        if (!kid) {
            throw new Error('No "kid" in token header');
        }

        // Verify the token
        const key = await client.getSigningKey(kid);
        const signingKey = key.getPublicKey();
        const event = jwt.verify(token, signingKey) as KindeEvent;

        switch (event?.type) {
            case "user.created":
                createContainer(event.data.id)
                console.log(event.data);
                break;
            default:
                break;
        }

    } catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
            return NextResponse.json({ message: err.message }, { status: 400 });
        }
    }
    return NextResponse.json({ status: 200, statusText: "success" });
}