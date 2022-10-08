import React, { useEffect, useState } from 'react'
import { Button } from 'react-native'

/**
 * NOTE: Potentialy better to use ogg sound format
 */

export interface BackgroundSoundProps {
  url: string
}

const BackgroundSound = ({ url }: BackgroundSoundProps) => {
  const [isReady, setReady] = useState(false)
  const [isPlaying, setPlaying] = useState(false)
  const audioRef = React.useRef<HTMLAudioElement>(null)

  useEffect(() => {
    setReady(false)
  }, [url])

  useEffect(() => {
    if (!audioRef.current) {
      // console.log('Audio not initialized yet')
      return
    }

    // audioRef.current.play()
  }, [audioRef])

  const handleToggerPress = async () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setPlaying(false)
      return
    }

    await audioRef.current.play()
    setPlaying(true)
  }

  const handleCanPlayThrough = async () => {
    setReady(true)

    if (!audioRef.current) return

    // try to auto play music browser allows
    try {
      audioRef.current.loop = true
      await audioRef.current.play()
      setPlaying(true)
    } catch (err) {
      // console.warn('Unable to auto play background sound.')
      // console.warn(err)
    }
  }

  return (
    <>
      {isReady && (
        <Button onPress={handleToggerPress} title={isPlaying ? '🔊' : '🔇'} />
      )}
      <audio ref={audioRef} onCanPlayThrough={handleCanPlayThrough}>
        <source src={url} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </>
  )
}

export default BackgroundSound
