import React from "react"
import {graphql} from "gatsby"
import Post from "../components/Post"
import Layout from "../components/Layout"
import SEO from "../components/SEO"

const Template = ({data}) => {
  const {markdownRemark} = data
  const {frontmatter, html} = markdownRemark
  return (
    <Layout>
      <SEO title={`${frontmatter.title}`} />
      <Post title={frontmatter.title} author={frontmatter.author}>
        <div dangerouslySetInnerHTML={{__html: html}} />
      </Post>
    </Layout>
  )
}

export default Template

export const pageQuery = graphql`
  query($path: String!) {
    markdownRemark(frontmatter: {path: {eq: $path}}) {
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
