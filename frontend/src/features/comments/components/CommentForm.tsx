import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert, Button } from '../../../components/ui';
import { CommentFormSchema, type CommentFormValues } from '../schemas';
import styles from './CommentForm.module.css';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
}

export function CommentForm({ onSubmit }: CommentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CommentFormValues>({
    resolver: zodResolver(CommentFormSchema),
    defaultValues: { content: '' },
  });

  const submit = async ({ content }: CommentFormValues) => {
    try {
      await onSubmit(content.trim());
      reset({ content: '' });
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : 'コメント投稿に失敗しました',
      });
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(submit)}>
      <textarea
        className={styles.textarea}
        placeholder="コメントを入力..."
        rows={3}
        disabled={isSubmitting}
        {...register('content')}
      />
      {errors.content && <Alert>{errors.content.message}</Alert>}
      {errors.root && <Alert>{errors.root.message}</Alert>}
      <div className={styles.actions}>
        <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
          {isSubmitting ? '投稿中...' : 'コメント投稿'}
        </Button>
      </div>
    </form>
  );
}
