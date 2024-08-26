import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux'

export default function LoadingBar() {
  const visible = useSelector(state => state.mainLogoSpinner.visible)
	if (visible) {
		return (
			<Row><Col style={{ textAlign: "center" }}>
				<svg xmlns="http://www.w3.org/2000/svg" width="10em" height="10em" viewBox="0 0 24 24" ><rect width={2.8} height={12} x={1} y={6} fill="currentColor"><animate id="svgSpinnersBarsScale0" attributeName="y" begin="0;svgSpinnersBarsScale1.end-0.075s" calcMode="spline" dur="0.45s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="6;1;6"></animate><animate attributeName="height" begin="0;svgSpinnersBarsScale1.end-0.075s" calcMode="spline" dur="0.45s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="12;22;12"></animate></rect><rect width={2.8} height={12} x={5.8} y={6} fill="currentColor"><animate attributeName="y" begin="svgSpinnersBarsScale0.begin+0.075s" calcMode="spline" dur="0.45s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="6;1;6"></animate><animate attributeName="height" begin="svgSpinnersBarsScale0.begin+0.075s" calcMode="spline" dur="0.45s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="12;22;12"></animate></rect><rect width={2.8} height={12} x={10.6} y={6} fill="currentColor"><animate attributeName="y" begin="svgSpinnersBarsScale0.begin+0.15s" calcMode="spline" dur="0.45s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="6;1;6"></animate><animate attributeName="height" begin="svgSpinnersBarsScale0.begin+0.15s" calcMode="spline" dur="0.45s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="12;22;12"></animate></rect><rect width={2.8} height={12} x={15.4} y={6} fill="currentColor"><animate attributeName="y" begin="svgSpinnersBarsScale0.begin+0.225s" calcMode="spline" dur="0.45s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="6;1;6"></animate><animate attributeName="height" begin="svgSpinnersBarsScale0.begin+0.225s" calcMode="spline" dur="0.45s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="12;22;12"></animate></rect><rect width={2.8} height={12} x={20.2} y={6} fill="currentColor"><animate id="svgSpinnersBarsScale1" attributeName="y" begin="svgSpinnersBarsScale0.begin+0.3s" calcMode="spline" dur="0.45s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="6;1;6"></animate><animate attributeName="height" begin="svgSpinnersBarsScale0.begin+0.3s" calcMode="spline" dur="0.45s" keySplines=".36,.61,.3,.98;.36,.61,.3,.98" values="12;22;12"></animate></rect></svg>
			</Col></Row>
		);
	} else {
		return null;
	}
}