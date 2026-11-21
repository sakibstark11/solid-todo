import styles from './SelectField.module.css';

type Props = {
  id: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  label?: string;
  'aria-label'?: string;
};

export default function SelectField(props: Props) {
  return (
    <label class={styles.field} for={props.id}>
      {props.label && <span class={styles.label}>{props.label}</span>}
      <select
        id={props.id}
        class={styles.control}
        aria-label={props['aria-label']}
        value={props.value}
        onChange={(event) => props.onChange(event.currentTarget.value)}
      >
        {props.options.map((option) => (
          <option value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
