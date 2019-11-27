import React from "react"

const style = {
  maxWidth: "700px",
  margin: "auto",
  padding: "1rem",
}

interface Props {
  children: React.ReactNode
  title: string
}

const Post: React.FC<Props> = ({ children, title }) => (
  <article style={style}>
    <h1>{title}</h1>
    {children}
  </article>
)

export default Post
