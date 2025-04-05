import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

/**
 * @typedef {Object} FormData
 * @property {string} name - The name input value
 * @property {string} email - The email input value
 */

/**
 * Component for an example form with name and email inputs.
 * @param {Object} props - Component props
 * @param {FormData} props.initialData - The initial form data
 * @param {Function} props.onSubmit - Function to handle form submission
 * @returns {JSX.Element} JSX element representing the form
 */
const ExampleForm = ({ initialData, onSubmit }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: initialData,
    resolver: yupResolver(schema),
  });

  /**
   * Handles the form submission by calling the onSubmit prop function.
   * @param {FormData} data - The form data to submit
   */
  const submitHandler = (data) => {
    onSubmit(data);
  };

  /**
   * Resets the form fields to the initial data.
   */
  const cancelHandler = () => {
    reset(initialData);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)}>
      <div>
        <label>Name</label>
        <input {...register('name')} />
        {errors.name && <p>{errors.name.message as string}</p>}
      </div>

      <div>
        <label>Email</label>
        <input {...register('email')} />
        {errors.email && <p>{errors.email.message as string}</p>}
      </div>

      <button type="submit">Submit</button>
      <button type="button" onClick={cancelHandler} disabled={!isDirty}>
        Cancel
      </button>
    </form>
  );
};

export default ExampleForm;