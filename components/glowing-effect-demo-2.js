function GlowingEffectDemoSecond() {
  try {
    return React.createElement("ul", {
      className: "grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2",
      "data-name": "glowing-effect-demo",
      "data-file": "components/glowing-effect-demo-2.js"
    },
      React.createElement(GridItem, {
        area: "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]",
        icon: React.createElement("div", { className: "icon-sparkles text-xl text-black dark:text-neutral-400" }),
        title: "AI-Powered Organization",
        description: "Automatically categorize and tag your notes with smart AI that learns your workflow patterns."
      }),
      React.createElement(GridItem, {
        area: "md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]",
        icon: React.createElement("div", { className: "icon-users text-xl text-black dark:text-neutral-400" }),
        title: "Real-Time Collaboration",
        description: "Work seamlessly with your team. Share ideas, comment, and edit together in real-time."
      }),
      React.createElement(GridItem, {
        area: "md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]",
        icon: React.createElement("div", { className: "icon-shield text-xl text-black dark:text-neutral-400" }),
        title: "Enterprise-Grade Security",
        description: "Your data is protected with end-to-end encryption and SOC 2 compliance standards."
      }),
      React.createElement(GridItem, {
        area: "md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]",
        icon: React.createElement("div", { className: "icon-search text-xl text-black dark:text-neutral-400" }),
        title: "Lightning-Fast Search",
        description: "Find any note instantly with our advanced search that understands context and meaning."
      }),
      React.createElement(GridItem, {
        area: "md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]",
        icon: React.createElement("div", { className: "icon-refresh-cw text-xl text-black dark:text-neutral-400" }),
        title: "Cross-Platform Sync",
        description: "Access your notes anywhere - web, mobile, or desktop. Everything stays in perfect sync."
      })
    );
  } catch (error) {
    console.error('GlowingEffectDemoSecond component error:', error);
    return null;
  }
}

function GridItem({ area, icon, title, description }) {
  try {
    return React.createElement("li", {
      className: `min-h-[14rem] list-none ${area}`,
      "data-name": "grid-item",
      "data-file": "components/glowing-effect-demo-2.js"
    },
      React.createElement("div", {
        className: "relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3"
      },
        React.createElement(GlowingEffect, {
          blur: 0,
          borderWidth: 3,
          spread: 80,
          glow: true,
          disabled: false,
          proximity: 64,
          inactiveZone: 0.01
        }),
        React.createElement("div", {
          className: "border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]"
        },
          React.createElement("div", {
            className: "relative flex flex-1 flex-col justify-between gap-3"
          },
            React.createElement("div", {
              className: "w-fit rounded-lg border border-gray-600 p-2"
            }, icon),
            React.createElement("div", {
              className: "space-y-3"
            },
              React.createElement("h3", {
                className: "-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] dark:text-white"
              }, title),
              React.createElement("h2", {
                className: "font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold"
              }, description)
            )
          )
        )
      )
    );
  } catch (error) {
    console.error('GridItem component error:', error);
    return null;
  }
}