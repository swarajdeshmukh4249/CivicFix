function Header() {
  try {
    return React.createElement("header", {
      className: "bg-[var(--background)] border-b border-[var(--border)] sticky top-0 z-50",
      "data-name": "header",
      "data-file": "components/header.js"
    },
      React.createElement("div", {
        className: "max-w-7xl mx-auto px-6 py-4"
      },
        React.createElement("div", {
          className: "flex items-center justify-between"
        },
          React.createElement("div", {
            className: "flex items-center space-x-3"
          },
            React.createElement("div", {
              className: "relative w-10 h-10"
            },
              React.createElement("div", {
                className: "absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl transform rotate-12"
              }),
              React.createElement("div", {
                className: "absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl transform -rotate-12"
              }),
              React.createElement("div", {
                className: "absolute inset-0 bg-black rounded-xl flex items-center justify-center"
              },
                React.createElement("span", {
                  className: "text-white font-bold text-lg"
                }, "M")
              )
            ),
            React.createElement("span", {
              className: "text-2xl font-bold text-[var(--foreground)] tracking-tight"
            }, "Motion")
          ),
          React.createElement("nav", {
            className: "hidden md:flex items-center space-x-8"
          },
            React.createElement("a", {
              href: "#features",
              className: "text-[var(--secondary-color)] hover:text-[var(--foreground)] transition-colors"
            }, "Features"),
            React.createElement("a", {
              href: "#pricing",
              className: "text-[var(--secondary-color)] hover:text-[var(--foreground)] transition-colors"
            }, "Pricing"),
            React.createElement("a", {
              href: "#about",
              className: "text-[var(--secondary-color)] hover:text-[var(--foreground)] transition-colors"
            }, "About"),
            React.createElement("a", {
              href: "#contact",
              className: "text-[var(--secondary-color)] hover:text-[var(--foreground)] transition-colors"
            }, "Contact")
          ),
          React.createElement("div", {
            className: "flex items-center space-x-4"
          },
            React.createElement("button", {
              className: "text-[var(--secondary-color)] hover:text-[var(--foreground)] transition-colors"
            }, "Sign In"),
            React.createElement("button", {
              className: "btn btn-black px-6 py-2 rounded-lg"
            }, "Get Started")
          )
        )
      )
    );
  } catch (error) {
    console.error('Header component error:', error);
    return null;
  }
}