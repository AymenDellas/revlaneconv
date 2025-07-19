import React from "react";
import { Rocket } from "lucide-react";
import AuditForm from "../components/AuditForm";

const page = () => {
  return (
    <main className="font-poppins flex min-h-screen flex-col items-center  py-24">
      <div className="flex flex-col justify-center text-center space-y-8">
        <span className="w-fit mx-auto rounded-full p-4 bg-blue-200 text-blue-600">
          <Rocket size={40} />
        </span>
        <h1 className="text-5xl font-bold">Landing Page Audit Agent</h1>
        <p className="text-lg text-gray-800 w-[70%] mx-auto ">
          Get your landing page audited by AI. Receive a detailed CRO breakdown and a Conversion Readiness Score to improve your conversion rates.
        </p>
      </div>
      <AuditForm />
    </main>
  );
};

export default page;
