/**
 * Import required libraries
 */
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

/**
 * Define a validation schema using Yup
 *
 * @type {Object}
 */
const schema = yup.object().shape({
  /**
   * Name field validation
   *
   * @see {@link https://www.npmjs.com/package/yup#validating-values}
   */
  name: yup.string().required('Name is required'),
  /**
   * Email field validation
   *
   * @see {@link https://www.npmjs.com/package/yup#validating-values}
   */
  email: yup.string().email('Email must be a valid email').required('Email is required'),
});

/**
 * ExampleForm component
 *
 * Handles form submission, cancelation, and field validation.
 *
 * @param {Object} props
 * @param {Object} [props.initialData] Initial data for the form fields.
 * @param {Function} [props.onSubmit] Callback function to call on form submission.
 */
const ExampleForm = ({ initialData, onSubmit }) => {
  /**
   * Form state management using react-hook-form
   *
   * @type {Object}
   */
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
   * Handles form submission by calling the onSubmit prop
   *
   * @param {Object} data Form data to be submitted.
   */
  const submitHandler = (data) => {
    onSubmit(data); // Call the onSubmit prop to update data
  };

  /**
   * Resets the form fields to the initial data on cancelation
   */
  const cancelHandler = () => {
    reset(initialData); // Resets form to initialData
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