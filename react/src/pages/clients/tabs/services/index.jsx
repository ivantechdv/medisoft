import React, { useState, useEffect, useRef } from 'react';
import { getData, postData, putData } from '../../../../api';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Select from '../../../../components/Select';
import Spinner from '../../../../components/Spinner/Spinner';
import ToastNotify from '../../../../components/toast/toast';
import './services.css';
import { FaPlusCircle, FaSearch, FaEdit, FaMinusCircle } from 'react-icons/fa';
import {
  ConfirmSweetAlert,
  InfoSweetAlert,
} from '../../../../components/SweetAlert/SweetAlert';
import ServicesTable from './service/services_table';
import InvoicesTable from './invoice/invoice_table';
const Index = ({ id, onFormData, onGetRecordById }) => {
  const servicesTableRef = useRef();
  const invoicesTableRef = useRef();
  const updateListInvoice = (origin) => {
    if (origin === 'invoice') {
      servicesTableRef.current.updateListService();
    }
  };

  const updateListService = (origin) => {
    if (origin === 'service') {
      invoicesTableRef.current.updateListInvoice();
    }
  };
  return (
    <>
      <ServicesTable
        id={id}
        onFormData={onFormData}
        onGetRecordById={onGetRecordById}
        ref={servicesTableRef}
        updateList={updateListService}
      />
      <InvoicesTable
        id={id}
        onFormData={onFormData}
        onGetRecordById={onGetRecordById}
        ref={invoicesTableRef}
        updateList={updateListInvoice}
      />
    </>
  );
};

export default Index;
