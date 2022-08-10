import { LoaderFunction } from "@remix-run/node";
import { serveTailwindCss } from "remix-tailwind";

export const loader: LoaderFunction = () => serveTailwindCss("app/style.css");
