import { Button, Card, CardActions, CardContent, InputLabel } from "@material-ui/core";
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import { navigate } from "hookrouter";
import moment from 'moment';
import React, { useReducer, useState } from "react";
import { useDispatch } from "react-redux";
import { createTriageForm } from "../../Redux/actions";
import * as Notification from "../../Utils/Notifications.js";
import { DateInputField, TextInputField } from "../Common/HelperInputFields";
import { Loading } from "../Common/Loading";
import PageTitle from "../Common/PageTitle";
import { PatientStatsModel } from "./models";

interface triageFormProps extends PatientStatsModel {
  facilityId: number;
  id?: number;
}


const initForm: any = {
  entry_date: null,
  num_patients_visited: "",
  num_patients_home_quarantine: "",
  num_patients_isolation: "",
  num_patient_referred: "",
};

const initialState = {
  form: { ...initForm },
  errors: { ...initForm }
};

const triageFormReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case "set_form": {
      return {
        ...state,
        form: action.form
      };
    }
    case "set_error": {
      return {
        ...state,
        errors: action.errors
      };
    }
    default:
      return state;
  }
};

const goBack = () => {
  window.history.go(-1);
};

export const TriageForm = (props: triageFormProps) => {
  const dispatchAction: any = useDispatch();
  const { facilityId, id } = props;
  const [state, dispatch] = useReducer(triageFormReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);

  const headerText = !id ? "Add Triage" : "Edit Triage";
  const buttonText = !id ? "Save Triage" : "Update Triage";

  const validateForm = () => {
    let errors = { ...initForm };
    let invalidForm = false;
    Object.keys(state.form).forEach((field, i) => {
      switch (field) {
        case "entry_date":
          if (!state.form[field]) {
            errors[field] = "Field is required";
            invalidForm = true;
          }
          return;
        default:
          return;
      }
    });
    if (invalidForm) {
      dispatch({ type: "set_error", errors });
      return false;
    }
    dispatch({ type: "set_error", errors });
    return true;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const validForm = validateForm();
    if (validForm) {
      setIsLoading(true);
      const data = {
        entry_date: `${moment(state.form.entry_date).format('YYYY-MM-DD')}`,
        num_patients_visited: Number(state.form.num_patients_visited),
        num_patients_home_quarantine: Number(state.form.num_patients_home_quarantine),
        num_patients_isolation: Number(state.form.num_patients_isolation),
        num_patient_referred: Number(state.form.num_patient_referred),
      };

      const res = await dispatchAction(createTriageForm(data, { facilityId }));
      setIsLoading(false);
      if (res && res.data) {
        dispatch({ type: "set_form", form: initForm });
        if (id) {
          Notification.Success({
            msg: "Triage updated successfully"
          });
        } else {
          Notification.Success({
            msg: "Triage created successfully"
          });
          navigate(`/facility/${facilityId}`);
        }
      }
    }
  };

  const handleChange = (e: any) => {
    let form = { ...state.form };
    form[e.target.name] = e.target.value;
    dispatch({ type: "set_form", form });
  };

  const handleDateChange = (date: any, key: string) => {
    let form = { ...state.form };
    form[key] = date;
    dispatch({ type: "set_form", form });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <PageTitle title={headerText} />
      <div className="mt-4">
        <Card>
          <form onSubmit={e => handleSubmit(e)}>
            <CardContent>
              <DateInputField
                label="Entry Date"
                value={state.form.entry_date}
                onChange={date => handleDateChange(date, "entry_date")}
                errors={state.errors.entry_date}
              />
            </CardContent>
            <CardContent>
              <InputLabel id="num-patients-visited-label">Patients Visited</InputLabel>
              <TextInputField
                name="num_patients_visited"
                variant="outlined"
                margin="dense"
                type="number"
                InputLabelProps={{ shrink: !!state.form.num_patients_visited }}
                value={state.form.num_patients_visited}
                onChange={handleChange}
                errors={state.errors.num_patients_visited}
              />
            </CardContent>
            <CardContent>
              <InputLabel id="num-patients-home-quarantine-label">Patients in Home Quarantine</InputLabel>
              <TextInputField
                name="num_patients_home_quarantine"
                variant="outlined"
                margin="dense"
                type="number"
                InputLabelProps={{ shrink: !!state.form.num_patients_home_quarantine }}
                value={state.form.num_patients_home_quarantine}
                onChange={handleChange}
                errors={state.errors.num_patients_home_quarantine}
              />
            </CardContent>
            <CardContent>
              <InputLabel id="num-patients-isolation-label">Patients in Isolation</InputLabel>
              <TextInputField
                name="num_patients_isolation"
                variant="outlined"
                margin="dense"
                type="number"
                InputLabelProps={{ shrink: !!state.form.num_patients_isolation }}
                value={state.form.num_patients_isolation}
                onChange={handleChange}
                errors={state.errors.num_patients_isolation}
              />
            </CardContent>
            <CardContent>
              <InputLabel id="num-patient-referred-label">Patients Referred so far</InputLabel>
              <TextInputField
                name="num_patient_referred"
                variant="outlined"
                margin="dense"
                type="number"
                InputLabelProps={{ shrink: !!state.form.num_patient_referred }}
                value={state.form.num_patient_referred}
                onChange={handleChange}
                errors={state.errors.num_patient_referred}
              />
            </CardContent>

            <CardActions
              className="padding16"
              style={{ justifyContent: "space-between" }}
            >
              <Button
                color="default"
                variant="contained"
                type="button"
                onClick={goBack}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                variant="contained"
                type="submit"
                style={{ marginLeft: "auto" }}
                startIcon={<CheckCircleOutlineIcon>save</CheckCircleOutlineIcon>}
                onClick={e => handleSubmit(e)}
              >
                {buttonText}
              </Button>
            </CardActions>
          </form>
        </Card>
      </div>
    </div>
  );
};
