import React from "react"
import styles from "./Nav.module.css"

const Nav = ({children, brand, hidden, setHidden}) => (
  <nav className={styles.root}>
    <input
      className={styles.input}
      type="checkbox"
      checked={!hidden}
      onChange={() => setHidden(!hidden)}
      id="navbar-toggle"
    />
    <label className={styles.button} htmlFor="navbar-toggle">
      Navigation Menu Toggle
    </label>
    <h1 className={styles.brand}>{brand}</h1>
    <ul className={styles.list}>{children}</ul>
  </nav>
)

export default Nav
