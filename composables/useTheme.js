export const useTheme = () => {
  const isDark = useState("theme-dark", () => {
    if (process.client) {
      const stored = localStorage.getItem("theme");
      return (
        stored === "dark" ||
        (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return true;
  });

  const toggleTheme = () => {
    isDark.value = !isDark.value;

    if (process.client) {
      localStorage.setItem("theme", isDark.value ? "dark" : "light");

      if (isDark.value) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const initTheme = () => {
    if (process.client) {
      const stored = localStorage.getItem("theme");
      const shouldBeDark =
        stored === "dark" ||
        (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);

      isDark.value = shouldBeDark;

      if (shouldBeDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  return {
    isDark,
    toggleTheme,
    initTheme,
  };
};
