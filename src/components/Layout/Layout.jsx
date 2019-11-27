import React, {useState} from "react"
import styles from "./Layout.module.css"
import {Link} from "gatsby"
import Nav from "../Nav"

const Layout = ({children}) => {
  const [navHidden, setNavHidden] = useState(true)
  const brand = (
    <Link className={styles.brand} to="/" onClick={() => setNavHidden(true)}>
      <strong>Joco</strong>Blog
    </Link>
  )

  return (
    <div>
      <header>
        <Nav brand={brand} hidden={navHidden} setHidden={setNavHidden}>
          <li>
            <Link
              className={styles.link}
              to="/"
              onClick={() => setNavHidden(true)}
            >
              Home
            </Link>
          </li>
        </Nav>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        © {new Date().getFullYear()}, Joshua Cooper
      </footer>
    </div>
  )
}

export default Layout
