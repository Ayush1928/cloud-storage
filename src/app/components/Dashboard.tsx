"use client"
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import axios from "axios";
import { FunctionComponent, useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs";

interface IDashboardProps {
    user: KindeUser
}

type Blob = {
    name: string,
    url: string
}

const Dashboard: FunctionComponent<IDashboardProps> = ({ user }) => {
    const [files, setFiles] = useState<Blob[] | null>(null);
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
    const id = user ? user.id.toLowerCase().replace(/[^a-z0-9-]/g, '') : ''

    const handleDeleteFile = async (fileName: string) => {
        const data = axios.delete(`${baseURL}/blob/delete`, {
            params: {
                id: id,
                filename: fileName
            }
        });
        if ((await data).status === 200) {
            fetchFiles();
        }
    }

    const fetchFiles = async () => {
        try {
            const response = await axios.get(`${baseURL}/container/view`, {
                params: {
                    id: id
                }
            });
            setFiles(response.data.blobs);
        } catch (error: any) {
            if (error.response && error.response.data.message === "Error retrieving blobs") {
                console.log("Container not found. Attempting to create a new one.");
                try {
                    await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/container/create`, {
                        id: id.toLowerCase().replace(/[^a-z0-9-]/g, '')
                    });
                    console.log("New container created. Refetching files.");

                    // Refetch files after creating the container
                    const newResponse = await axios.get(`${baseURL}/container/view`, {
                        params: {
                            id: id
                        }
                    });
                    setFiles(newResponse.data.blobs);
                } catch (createError) {
                    console.error("Error creating new container:", createError);
                    // Handle the error (e.g., show a user-friendly message)
                }
            } else {
                console.error("Error fetching files:", error);
                // Handle other types of errors
            }
        }
    };

    const handleAddFile = async () => {
        const fileInput = document.querySelector<HTMLInputElement>('#blob');
        if (fileInput && fileInput.files && fileInput.files[0]) {
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            formData.append('id', id);

            try {
                const response = await axios.post(`${baseURL}/blob/create`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                if (response.status === 200) {
                    fetchFiles();
                }
            } catch (error) {
                console.error("Error uploading file:", error);
            }
        }
    };


    useEffect(() => {
        fetchFiles();
    }, [])


    return (
        <main className="flex min-h-screen flex-col items-center justify-center px-24">
            <div className="bg-[#121212] h-[80vh] w-full rounded-xl p-8 flex flex-col justify-between">
                <div className="flex flex-col gap-y-4">
                    <div className="flex justify-between w-full items-center">
                        <h1 className="text-white text-xl font-bold">Hello {user?.given_name},</h1>
                        <div className="flex text-white items-center gap-x-4"><p className="w-[110px]">Add File:</p>
                            <Input className="text-center relative" id="blob" type="file" />
                            <Button className="bg-gray-200 text-[#121212] hover:bg-gray-300" onClick={handleAddFile}>Upload</Button>
                        </div>
                    </div>
                    <Table>
                        <TableCaption className="text-gray-400">A list of your files.</TableCaption>
                        <TableHeader>
                            <TableRow className="">
                                <TableHead className="min-w-[200px] text-gray-200">NAME</TableHead>
                                <TableHead className="w-full text-gray-200">URL</TableHead>
                                <TableHead className="min-w-[200px] text-gray-200 text-center">DELETE</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="text-white">
                            {files && files.map((file, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{file.name}</TableCell>
                                    <Link href={file.url} target="_blank" className="min-w-full">
                                        <TableCell className="truncate">{file.url}</TableCell>
                                    </Link>
                                    <TableCell className="">
                                        <div className="flex justify-center w-full">
                                            <Trash2 className="hover:cursor-pointer" onClick={() => handleDeleteFile(file.name)} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <Button className="bg-gray-200 text-[#121212] hover:bg-gray-300 bottom-0 w-min mx-auto"><LogoutLink>Logout</LogoutLink></Button>
            </div>
        </main>
    );
};

export default Dashboard;
