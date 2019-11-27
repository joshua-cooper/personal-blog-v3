import React from "react"
import styles from "./Layout.module.css"
import { Link } from "gatsby"

const Layout = ({ children }) => {
  return (
    <div>
      <header className={styles.header}>
        <Link to="/">JocoBlog</Link>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        © {new Date().getFullYear()}, Joshua Cooper
      </footer>
    </div>
  )
}

export default Layout
