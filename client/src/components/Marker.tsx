import React, { useEffect } from "react";


interface Props extends google.maps.MarkerOptions {
  color?: string;
  onClick?: CallableFunction;
  strokeColor?: string;
}
const Marker: React.FC<Props> = (options) => {
  const [marker, setMarker] = React.useState<google.maps.Marker>();

  useEffect(() => {
    if (!marker) {
      setMarker(new google.maps.Marker());
    }

    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [marker]);

  useEffect(() => {
    if (marker && options.onClick) {
      return google.maps.event.addListener(marker, 'click', options.onClick).remove;
    }
  }, [options.onClick, marker])

  useEffect(() => {
    // Copied from https://stackoverflow.com/a/23163930/15405467
    const pinColor = options.color || '#ea4355';

    // Pick your pin (hole or no hole)
    const pinSVGFilled = "M 12,2 C 8.1340068,2 5,5.1340068 5,9 c 0,5.25 7,13 7,13 0,0 7,-7.75 7,-13 0,-3.8659932 -3.134007,-7 -7,-7 z";
    const labelOriginFilled =  new google.maps.Point(12,9);


    const markerImage = {  // https://developers.google.com/maps/documentation/javascript/reference/marker#MarkerLabel
        path: pinSVGFilled,
        anchor: new google.maps.Point(12,17),
        fillOpacity: 1,
        fillColor: pinColor,
        strokeWeight: 2,
        strokeColor: options.strokeColor || "white",
        scale: 2,
        labelOrigin: labelOriginFilled
    };

    if (marker) {
      marker.setOptions({...options, 
        icon: markerImage,
      });
    }
  }, [marker, options]);

  return null;
}

export default Marker;