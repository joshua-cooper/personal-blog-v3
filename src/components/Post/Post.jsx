import React from "react"
import styles from "./Post.module.css"

const Post = ({children, title, author}) => (
  <article className={styles.root}>
    <h1 className={styles.title}>{title}</h1>
    <small className={styles.author}>{author}</small>
    {children}
  </article>
)

export default Post
