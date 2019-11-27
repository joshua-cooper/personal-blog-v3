import React from "react"
import { graphql } from "gatsby"
import Post from "../components/Post"

const Template = ({ data }) => {
  const { markdownRemark } = data
  const { frontmatter, html } = markdownRemark
  return (
    <Post title={frontmatter.title}>
      <div
        className="blog-post-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Post>
  )
}

export default Template

export const pageQuery = graphql`
  query($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        path
        title
      }
    }
  }
`
