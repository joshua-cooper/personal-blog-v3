import React from "react"

const articleStyle = {
  maxWidth: "700px",
  margin: "auto",
  padding: "1.5rem",
}

const titleStyle = {
  fontSize: "2rem",
  paddingBottom: "1rem",
}

const authorStyle = {
  fontSize: "1rem",
  fontWeight: 100,
}

interface Props {
  children: React.ReactNode
  title: string
  author: string
}

const Post: React.FC<Props> = ({ children, title, author }) => (
  <article style={articleStyle}>
    <h1 style={titleStyle}>{title}</h1>
    <small style={authorStyle}>{author}</small>
    {children}
  </article>
)

export default Post
