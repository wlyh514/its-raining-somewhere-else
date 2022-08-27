import React, { useEffect, useState } from 'react';
import { classNames } from '../utils';

interface BtnInfo {
  key: string;
  value: string; 
}

type Props = {
  btns: BtnInfo[];
  onFocusChange?: (key: string) => any;
}

const ButtonGroup: React.FC<Props> = ({btns, onFocusChange}) => {
  const [activeKey, setActiveKey] = useState<string>(btns[0].key);

  useEffect(() => {
    if (onFocusChange) {
      onFocusChange(activeKey);
    }
  }, [activeKey])

  return (
    <div className='btn-group'>
      {
        btns.map(btn => {
          return <div 
            onClick={() => setActiveKey(btn.key)} 
            className={classNames({
              'btn-group-btn': true
              , 'active': activeKey === btn.key
            })}
            key={btn.key}
          >
            {
              btn.value
            }
          </div>
        })
      }
    </div>
  );
}

export default ButtonGroup;