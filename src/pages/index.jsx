import React from "react"
import {graphql} from "gatsby"
import Layout from "../components/Layout"
import SEO from "../components/SEO"

import {Link} from "gatsby"

const PostLink = ({post}) => (
  <div>
    <Link style={{textDecoration: "none"}} to={post.frontmatter.path}>
      <h2>{post.frontmatter.title}</h2>
      <small>{post.frontmatter.date}</small>
    </Link>
  </div>
)

const IndexPage = ({
  data: {
    allMarkdownRemark: {edges},
  },
}) => {
  const Posts = edges
    .filter(edge => !!edge.node.frontmatter.date)
    .map(edge => <PostLink key={edge.node.id} post={edge.node} />)
  return (
    <Layout>
      <SEO title="Home" />
      <div>{Posts}</div>
    </Layout>
  )
}

export default IndexPage

export const pageQuery = graphql`
  query {
    allMarkdownRemark(sort: {order: DESC, fields: [frontmatter___date]}) {
      edges {
        node {
          id
          excerpt(pruneLength: 250)
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            path
            title
          }
        }
      }
    }
  }
`
