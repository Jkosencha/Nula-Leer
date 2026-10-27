import { useEffect } from "react";

const SITE = "Nula Leer";
const DEFAULT_TITLE = "Nula Leer · Handmade Leather Goods";
const DEFAULT_DESCRIPTION =
  "Nula Leer — handmade leather belts, wallets, purses and more, made in Nairobi, Kenya.";

// Sets the browser-tab title and meta description for the current page.
const usePageTitle = (title, description) => {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : DEFAULT_TITLE;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description || DEFAULT_DESCRIPTION);
  }, [title, description]);
};

export default usePageTitle;
