import type { YellowcakeData } from "@/types/profile";

// Raw tweet data extracted from Twitter/X
const rawTweets = [
  { "text": "both my f1 and kpop tier list please enjoy" },
  { "text": "tweeting for the first time in two years to let yall know i'm seeing artms in toronto rn" },
  { "text": "..oh ! that explains my taste in movies then" },
  { "text": "please my girls i need my family back together please please please" },
  { "text": "wow i havent listened to loona in so long that I teared up listening to this fckass song" },
  { "text": "guys my sisters are now the same age I was when I first made this account.. bro I cant believe I was on this app so young" },
  { "text": "really glad i didnt write my 500 word thinkpiece on gnarly bc that song is seriously growing on me now" },
  { "text": "lewis has an obsession with 1997s this year" },
  { "text": "please pray for my country and the people of kashmir.. this situation is so terrible 💔💔" },
  { "text": "i doubt this was intentional, but if it was o mein gott oscar you're literally goat championship mentality this is why I fawking love you" },
  { "text": "oconfuls are only allowed two seconds of happiness before it's snatched away again" },
  { "text": "lewis leading at my home race #needthat!!!" },
  { "text": "the real enemy is leclerc and the way no one gafs abt how aggressively he responds in his radios.. when he does it, it's just haha ferrari bad" },
  { "text": "mind you albon has spent the past three races undermined for his skill, chalking the praise towards sainz.. all poc drivers are at a disadvantage guyss (ofc some more than others) but albon is a terrible comparison" },
  { "text": "ohh my god he's gonna win in spain" },
  { "text": "like at least give oscar the chance and then switch back if he isn't making any serious gains like it was quite senseless to me" },
  { "text": "also lowkey this race proved to me that mclaren are fully backing norris... like they did not wanna risk that p2 and let max lead the wdc" },
];

/**
 * Get hardcoded Twitter/X tweets formatted for YellowcakeData
 */
export function getHardcodedTweets(): Array<{ text: string }> {
  return rawTweets;
}

/**
 * Get hardcoded Twitter data formatted for YellowcakeData
 */
export function getHardcodedTwitterData(): Partial<YellowcakeData> {
  return {
    tweets: getHardcodedTweets(),
  };
}
