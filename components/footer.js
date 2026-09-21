function Footer() {
  try {
    return React.createElement("footer", {
      className: "bg-[var(--muted)] border-t border-[var(--border)] mt-24",
      "data-name": "footer",
      "data-file": "components/footer.js"
    },
      React.createElement("div", {
        className: "max-w-7xl mx-auto px-6 py-12"
      },
        React.createElement("div", {
          className: "grid grid-cols-1 md:grid-cols-4 gap-8"
        },
          React.createElement("div", {
            className: "space-y-4"
          },
            React.createElement("div", {
              className: "flex items-center space-x-3"
            },
              React.createElement("div", {
                className: "relative w-8 h-8"
              },
                React.createElement("div", {
                  className: "absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg transform rotate-12"
                }),
                React.createElement("div", {
                  className: "absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg transform -rotate-12"
                }),
                React.createElement("div", {
                  className: "absolute inset-0 bg-black rounded-lg flex items-center justify-center"
                },
                  React.createElement("span", {
                    className: "text-white font-bold text-sm"
                  }, "M")
                )
              ),
              React.createElement("span", {
                className: "text-xl font-bold text-[var(--foreground)] tracking-tight"
              }, "Motion")
            ),
            React.createElement("p", {
              className: "text-[var(--secondary-color)] text-sm leading-relaxed"
            }, "Smart note-taking for modern teams. Capture, organize, and collaborate with AI-powered tools.")
          ),
          React.createElement("div", {
            className: "space-y-4"
          },
            React.createElement("h4", {
              className: "font-semibold text-[var(--foreground)]"
            }, "Product"),
            React.createElement("ul", {
              className: "space-y-2 text-sm"
            },
              React.createElement("li", null,
                React.createElement("a", {
                  href: "#",
                  className: "text-[var(--secondary-color)] hover:text-[var(--foreground)] transition-colors"
                }, "Features")
              ),
              React.createElement("li", null,
                React.createElement("a", {
                  href: "#",
                  className: "text-[var(--secondary-color)] hover:text-[var(--foreground)] transition-colors"
                }, "Pricing")
              ),
              React.createElement("li", null,
                React.createElement("a", {
                  href: "#",
                  className: "text-[var(--secondary-color)] hover:text-[var(--foreground)] transition-colors"
                }, "Security")
              )
            )
          ),
          React.createElement("div", {
            className: "space-y-4"
          },
            React.createElement("h4", {
              className: "font-semibold text-[var(--foreground)]"
            }, "Company"),
            React.createElement("ul", {
              className: "space-y-2 text-sm"
            },
              React.createElement("li", null,
                React.createElement("a", {
                  href: "#",
                  className: "text-[var(--secondary-color)] hover:text-[var(--foreground)] transition-colors"
                }, "About")
              ),
              React.createElement("li", null,
                React.createElement("a", {
                  href: "#",
                  className: "text-[var(--secondary-color)] hover:text-[var(--foreground)] transition-colors"
                }, "Careers")
              ),
              React.createElement("li", null,
                React.createElement("a", {
                  href: "#",
                  className: "text-[var(--secondary-color)] hover:text-[var(--foreground)] transition-colors"
                }, "Contact")
              )
            )
          ),
          React.createElement("div", {
            className: "space-y-4"
          },
            React.createElement("h4", {
              className: "font-semibold text-[var(--foreground)]"
            }, "Connect"),
            React.createElement("div", {
              className: "flex space-x-4"
            },
              React.createElement("a", {
                href: "#",
                className: "w-8 h-8 bg-[var(--border)] rounded-lg flex items-center justify-center hover:bg-[var(--secondary-color)] transition-colors"
              },
                React.createElement("div", {
                  className: "icon-twitter text-sm text-[var(--foreground)]"
                })
              ),
              React.createElement("a", {
                href: "#",
                className: "w-8 h-8 bg-[var(--border)] rounded-lg flex items-center justify-center hover:bg-[var(--secondary-color)] transition-colors"
              },
                React.createElement("div", {
                  className: "icon-linkedin text-sm text-[var(--foreground)]"
                })
              ),
              React.createElement("a", {
                href: "#",
                className: "w-8 h-8 bg-[var(--border)] rounded-lg flex items-center justify-center hover:bg-[var(--secondary-color)] transition-colors"
              },
                React.createElement("div", {
                  className: "icon-github text-sm text-[var(--foreground)]"
                })
              )
            )
          )
        ),
        React.createElement("div", {
          className: "border-t border-[var(--border)] mt-8 pt-8 flex flex-col md:flex-row justify-between items-center"
        },
          React.createElement("p", {
            className: "text-sm text-[var(--secondary-color)]"
          }, "© 2024 Motion. All rights reserved."),
          React.createElement("div", {
            className: "flex space-x-6 mt-4 md:mt-0"
          },
            React.createElement("a", {
              href: "#",
              className: "text-sm text-[var(--secondary-color)] hover:text-[var(--foreground)] transition-colors"
            }, "Privacy Policy"),
            React.createElement("a", {
              href: "#",
              className: "text-sm text-[var(--secondary-color)] hover:text-[var(--foreground)] transition-colors"
            }, "Terms of Service")
          )
        )
      )
    );
  } catch (error) {
    console.error('Footer component error:', error);
    return null;
  }
}