import { NextResponse } from "next/server";
import jwksClient from "jwks-rsa";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import axios from "axios";

const client = jwksClient({
    jwksUri: `${process.env.KINDE_ISSUER_URL}/.well-known/jwks.json`,
});

export async function POST(req: Request) {
    try {
        // Get the token from the request
        const token = await req.text();

        // Decode the token
        const jwtDecoded = jwt.decode(token, { complete: true });

        if (!jwtDecoded) {
            return NextResponse.json({
                status: 500,
                statusText: "error decoding jwt",
            });
        }

        const header = jwtDecoded.header;
        const kid = header.kid;

        // Verify the token
        const key = await client.getSigningKey(kid);
        const signingKey = key.getPublicKey();
        const event = jwt.verify(token, signingKey) as JwtPayload;

        // Handle various events
        switch (event?.type) {
            case "user.created":
                console.log("New user created:", event.data);
                const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/container/create`, {
                    id: event.data.user.id.toLowerCase().replace(/[^a-z0-9-]/g, '')
                });
                console.log("Container creation response:", response.data);
                break;
            default:
                console.log("event not handled", event.type);
                break;
        }
    } catch (err) {
        if (err instanceof Error) {
            console.error(err);
            return NextResponse.json({ message: err.message }, { status: 500 });
        }
    }

    return NextResponse.json({ status: 200, statusText: "success" });
}