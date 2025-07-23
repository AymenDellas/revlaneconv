import React from "react";
import { Search } from "lucide-react";
import AuditForm from "../components/AuditForm";

const page = () => {
  return (
    <main className="font-poppins flex min-h-screen flex-col items-center  py-24">
      <div className="flex flex-col justify-center text-center space-y-8">
        <span className="w-fit mx-auto rounded-full p-4 bg-blue-200 text-blue-600">
          <Search size={40} />
        </span>
        <h1 className="text-5xl font-bold">Landing Page Audit</h1>
        <p className="text-lg text-gray-800 w-[70%] mx-auto ">
          Get a detailed CRO breakdown of your landing page. Enter a URL to
          receive a full analysis of your page's conversion potential.
        </p>
      </div>
      <AuditForm />
    </main>
  );
};

export default page;
