# INPUT_VIDEO=$1 TYPE=$2

# ffmpeg -i $INPUT_VIDEO -vf hue=s=0 BW/${INPUT_VIDEO%.*}.mov


# for INPUT_VIDEO in /var/old-timey/videos/* ; do
#   vidname=${INPUT_VIDEO:22}
#   ffmpeg -i $INPUT_VIDEO -vf hue=s=0 /var/old-timey/videos/BW/${vidname%.*}.mov
# done

INPUT_VIDEO=$1

vidname=${INPUT_VIDEO:22}

ffmpeg -v quiet -stats -i $INPUT_VIDEO -vf hue=s=0 /var/old-timey/videos/BW/${vidname%.*}_BW.mov
