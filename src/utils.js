const logRenditionChange = () => {
    let tracks = player.textTracks();
    let segmentMetadataTrack;
    
    for (let i = 0; i < tracks.length; i++) {
      if (tracks[i].label === 'segment-metadata') {
        segmentMetadataTrack = tracks[i];
      }
    }
    
    let previousPlaylist;
    
    if (segmentMetadataTrack) {
      segmentMetadataTrack.on('cuechange', function() {
        let activeCue = segmentMetadataTrack.activeCues[0];
    
        if (activeCue) {
          if (previousPlaylist !== activeCue.value.playlist) {
            console.log('Switched from rendition ' + previousPlaylist +
                        ' to rendition ' + activeCue.value.playlist + ' - Uri:' + activeCue.value.uri);
          }
          previousPlaylist = activeCue.value.playlist;
        }
      });
    }
}

export default logRenditionChange;
