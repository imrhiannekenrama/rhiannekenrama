'use client';
// Save as app/template.js: fades each new page in as the curtain lifts.
import { motion } from 'framer-motion';
export default function Template({ children }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>{children}</motion.div>;
}
