import Link from "next/link";

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4">
      <nav className="container mx-auto flex justify-between">
        <Link href="/" className="text-lg font-bold">
          AI Roaster
        </Link>
        <div>
          <Link href="/" className="mr-4">
            Roaster
          </Link>
          <Link href="/audit">
            Audit
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
