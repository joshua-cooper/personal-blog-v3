import React from "react"
import { graphql } from "gatsby"
import Post from "../components/Post"

const Template = ({ data }) => {
  const { markdownRemark } = data
  const { frontmatter, html } = markdownRemark
  return (
    <Post title={frontmatter.title} author={frontmatter.author}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </Post>
  )
}

export default Template

export const pageQuery = graphql`
  query($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        path
        title
        author
        date(formatString: "MMMM DD, YYYY")
      }
    }
  }
`
