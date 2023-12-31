import React, { useMemo } from "react";
import { useRecoilValue } from "recoil";
import { Typography, Paper, Divider, Grid } from "@mui/material";

import { performanceIndicatorsState } from "work-common/state/performanceIndicators";
import { Indicator, UnitOfMeasurement } from "work-types/performanceIndicator";

import { selectedEnterprise } from "../../state/selectedEnterprise";

import PerformanceIndicatorChart from "./components/PerformanceIndicatorChart";
import PerformanceGraph from "./components/PerformanceGraph";
import CreateTaxFormButton from "./components/CreateTaxFormButton";
import { withLoadInitData } from "./withLoadInitData";

const CURRENCY_VALUES = {
  [UnitOfMeasurement.EUR]: 41.28,
  [UnitOfMeasurement.USD]: 37.38,
  [UnitOfMeasurement.UAH]: 1,
};

const sortValues = (arr: Indicator["values"]) =>
  arr.sort((a, b) => {
    const [yearA, quarterA] = a.report_period.split("_");
    const [yearB, quarterB] = b.report_period.split("_");

    if (yearA === yearB) {
      return quarterA.localeCompare(quarterB);
    }

    return yearA.localeCompare(yearB);
  });

const EnterpriseDetails = () => {
  const { enterprise, reports } = useRecoilValue(selectedEnterprise);
  const performanceIndicators = useRecoilValue(performanceIndicatorsState);

  const indicators = useMemo(
    () =>
      performanceIndicators.map((ind) => ({
        indicator_id: ind.indicator_id,
        name: ind.name,
        importance: ind.importance,
        values: sortValues(
          reports.reduce<Indicator["values"]>((acc, rp) => {
            if (Object.prototype.hasOwnProperty.call(rp.fin_values, ind.indicator_id)) {
              const value =
                rp.fin_values[ind.indicator_id] * CURRENCY_VALUES[ind.unit_of_measurement];

              acc.push({
                report_period: rp.report_period,
                value: +value.toFixed(2),
              });
            }

            return acc;
          }, []),
        ),
      })) as Indicator[],
    [performanceIndicators, reports],
  );

  return (
    <Paper style={{ padding: "20px", margin: "20px" }}>
      <Typography variant="h4">{enterprise.name}</Typography>
      <Typography variant="body1">{enterprise.details}</Typography>
      <Divider style={{ margin: "20px 0" }} />
      <CreateTaxFormButton />
      <Divider style={{ margin: "20px 0" }} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="body2">Phone: {enterprise.phone}</Typography>
          <Typography variant="body2">Contact Person: {enterprise.contact_person}</Typography>
        </Grid>
      </Grid>
      <PerformanceGraph />
      {indicators.map((indicator) => (
        <div key={indicator.indicator_id}>
          <h3>{indicator.name}</h3>
          <PerformanceIndicatorChart indicator={indicator} />
        </div>
      ))}
    </Paper>
  );
};

export default withLoadInitData(EnterpriseDetails);
