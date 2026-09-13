import { useNavigate } from "react-router-dom";

export { cn } from "cn"

export function useAnchorNavigation() {
  const navigate = useNavigate();

  const handleAnchorNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();

    if (window.location.pathname === "/") {
      const id = href.slice(1);
      const element = document.getElementById(id);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      window.history.pushState(null, "", href);
    } else {
      navigate(`/${href}`);
    }
  };

  return handleAnchorNavigation;
}