declare module 'react-native-signature-canvas' {
  import * as React from 'react';
  export interface SignatureProps {
    onOK?: (signature: string) => void;
  onBegin?: () => void;
  onEnd?: () => void;
    onEmpty?: () => void;
    descriptionText?: string;
    clearText?: string;
    confirmText?: string;
    webStyle?: string;
    autoClear?: boolean;
    imageType?: 'image/png' | 'image/jpg' | 'image/jpeg';
    backgroundColor?: string;
    penColor?: string;
    dataURL?: string;
    androidHardwareAccelerationDisabled?: boolean;
    trimWhitespace?: boolean;
    rotateClockwise?: boolean;
    minStrokeWidth?: number;
    maxStrokeWidth?: number;
    scrollEnabled?: boolean;
    style?: any;
  }
  export default class Signature extends React.Component<SignatureProps> {}
}
