import { useState } from 'react';
import { View } from 'react-native';

import { clampAudioPosition, formatAudioTime } from '@/lib/audio-progress';

interface Props {current: number; duration: number; disabled: boolean; onSeek: (seconds: number) => void}

// Native React Native responder avoids adding another native dependency for a single control.
export function AudioSeekBar({current,duration,disabled,onSeek}: Props) {
  const [width,setWidth] = useState(0);
  const [draft,setDraft] = useState<number | null>(null);
  const at = (x: number) => clampAudioPosition(width ? x/width*duration : 0,duration);
  const displayed = draft ?? current;
  return <View accessibilityRole="adjustable" accessibilityLabel="Listening position"
    accessibilityState={{disabled}} accessibilityValue={{min:0,max:duration,now:displayed,text:formatAudioTime(displayed)}}
    accessibilityActions={[{name:'increment',label:'Forward 15 seconds'},{name:'decrement',label:'Back 15 seconds'}]}
    onAccessibilityAction={event => {if (!disabled) onSeek(clampAudioPosition(current+(event.nativeEvent.actionName==='increment' ? 15 : -15),duration));}}
    className={`h-12 justify-center ${disabled ? 'opacity-50' : ''}`}
    onLayout={event=>setWidth(event.nativeEvent.layout.width)}
    onStartShouldSetResponder={()=>!disabled && width>0} onMoveShouldSetResponder={()=>!disabled && width>0}
    onResponderGrant={event=>setDraft(at(event.nativeEvent.locationX))}
    onResponderMove={event=>setDraft(at(event.nativeEvent.locationX))}
    onResponderTerminationRequest={()=>false} onResponderTerminate={()=>setDraft(null)}
    onResponderRelease={event=>{const target=at(event.nativeEvent.locationX);setDraft(null);if (!disabled) onSeek(target);}}>
    <View pointerEvents="none" className="h-2 overflow-hidden rounded-full bg-primary-soft dark:bg-border-dark">
      <View className="h-full rounded-full bg-primary" style={{width:`${duration>0 ? Math.min(100,displayed/duration*100) : 0}%`}} />
    </View>
  </View>;
}
