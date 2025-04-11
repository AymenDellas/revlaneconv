import React from "react";
import { Rocket } from "lucide-react";
import CritiqueForm from "./components/CritiqueForm";
const page = () => {
  return (
    <main className="font-poppins flex min-h-screen flex-col items-center  py-24">
      <div className="flex flex-col justify-center text-center space-y-8">
        <span className="w-fit mx-auto rounded-full p-4 bg-blue-200 text-blue-600">
          <Rocket size={40} />
        </span>
        <h1 className="text-5xl font-bold">Webpage Roaster</h1>
        <p className="text-lg text-gray-800 w-[70%] mx-auto ">
          Get your webpage critiqued by AI. Receive honest feedback to improve
          your conversion rates and user experience.
        </p>
      </div>
      <CritiqueForm />
    </main>
  );
};

export default page;
