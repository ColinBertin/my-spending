import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import Login from "./login";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
});

export default function LoginPage() {
  return (
    <div
      className={`${instrumentSans.className} ${jetBrainsMono.variable} flex min-h-screen w-full items-center justify-center bg-[#EDEAE3] px-4 py-10`}
    >
      <Login />
    </div>
  );
}
