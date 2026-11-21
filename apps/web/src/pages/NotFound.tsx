import Button from '../components/Button';
import Icon from '../components/Icon';
import Panel from '../components/Panel';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <Panel class={styles.panel}>
      <span class={styles.icon}><Icon name="check-circle" size={24} /></span>
      <p class={styles.code}>404</p>
      <h2>Page not found</h2>
      <Button href="/"><Icon name="arrow-left" size={16} /> Go home</Button>
    </Panel>
  );
}
