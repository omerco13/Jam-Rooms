'use client';

import { FormControl, InputLabel, Select, MenuItem, SxProps, Theme } from '@mui/material';
import { INSTRUMENTS} from '@/types';

interface InstrumentSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
  sx?: SxProps<Theme>;
}

export function InstrumentSelect({
  value,
  onChange,
  label = 'Instrument',
  fullWidth = true,
  required = false,
  disabled = false,
  sx,
}: InstrumentSelectProps) {
  return (
    <FormControl fullWidth={fullWidth} required={required} disabled={disabled} sx={sx}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value)}
      >
        {INSTRUMENTS.map((inst) => (
          <MenuItem key={inst} value={inst}>
            {inst}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
