module.exports = {
  siteMetadata: {
    title: "JocoBlog",
    description:
      "Joshua Cooper's personal technology blog. I like to write about programming, devops, and technology in general. Rust, JavaScript, TypeScript, React, Docker.",
    author: "Joshua Cooper",
  },
  plugins: [
    "gatsby-plugin-react-helmet",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: `${__dirname}/src/images`,
      },
    },
    "gatsby-transformer-sharp",
    "gatsby-plugin-sharp",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "gatsby-starter-default",
        short_name: "starter",
        start_url: "/",
        background_color: "#04f",
        theme_color: "#04f",
        display: "minimal-ui",
        icon: "src/images/gatsby-icon.png",
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/src/posts`,
        name: "markdown-pages",
      },
    },
    "gatsby-transformer-remark",
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          {
            resolve: "gatsby-remark-vscode",
            options: {
              colorTheme: {
                defaultTheme: "Quiet Light",
                prefersDarkTheme: "Monokai",
              },
            },
          },
        ],
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // "gatsby-plugin-offline",
  ],
}
