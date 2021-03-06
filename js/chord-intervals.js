/**
 * Chord Intervals - these are the MIDI notes to select from when computing the note values.
 * New Chord Intervals can be added and they should show up in the control panel (after
 * redeployment), but remember acceptable MIDI values are between 0 and 127
 */
export const chords = {
  major: [
    [0, 4], [2, 5], [4, 7], [5, 9], [7, 11], [9, 12], [11, 14], [12, 16], [14, 17], [16, 19],
    [17, 21], [19, 23], [21, 24], [23, 26], [24, 28], [26, 29], [28, 31], [29, 33], [31, 35], [33, 36],
    [35, 38], [36, 40], [38, 41], [40, 43], [41, 45], [43, 47], [45, 48], [47, 50], [48, 52], [50, 53],
    [52, 55], [53, 57], [55, 59], [57, 60], [59, 62], [60, 64], [62, 65], [64, 67], [65, 69], [67, 71],
    [69, 72], [71, 74], [72, 76], [74, 77], [76, 79], [77, 81], [79, 81], [81, 84], [83, 86], [84, 88],
    [86, 89], [88, 91], [89, 93], [91, 95], [93, 96], [95, 98], [96, 100], [98, 101], [100, 103], [101, 105],
    [103, 107], [105, 108], [107, 110], [108, 112], [110, 113], [112, 115], [113, 117], [115, 119], [117, 120], [119, 122],
    [120, 124], [122, 125], [124, 127]
  ],
  major0: [
    0, 2, 4, 5, 7, 9, 11, 12, 14, 16,
    17, 19, 21, 23, 24, 26, 28, 29, 31, 33,
    35, 36, 38, 40, 41, 43, 45, 47, 48, 50,
    52, 53, 55, 57, 59, 60, 62, 64, 65, 67,
    69, 71, 72, 74, 76, 77, 79, 81, 83, 84,
    86, 88, 89, 91, 93, 95, 96, 98, 100, 101,
    103, 105, 107, 108, 110, 112, 113, 115, 117, 119,
    120, 122, 124
  ],
  major1: [
    4, 5, 7, 9, 11, 12, 14, 16, 17, 19,
    21, 23, 24, 26, 28, 29, 31, 33, 35, 36,
    38, 40, 41, 43, 45, 47, 48, 50, 52, 53,
    55, 57, 59, 60, 62, 64, 65, 67, 69, 71,
    72, 74, 76, 77, 79, 81, 81, 84, 86, 88,
    89, 91, 93, 95, 96, 98, 100, 101, 103, 105,
    107, 108, 110, 112, 113, 115, 117, 119, 120, 122,
    124, 125, 127
  ],
  minor: [
    [4, 11], [7, 14], [9, 16], [10, 17], [11, 18], [14, 21], [16, 23], [19, 26], [21, 28], [22, 29],
    [23, 30], [26, 33], [28, 35], [31, 38], [33, 40], [34, 41], [35, 42], [38, 45], [40, 47], [43, 50],
    [45, 52], [46, 53], [47, 54], [50, 57], [52, 59], [55, 62], [57, 64], [58, 65], [59, 66], [62, 69],
    [64, 71], [67, 74], [69, 76], [70, 77], [71, 78], [74, 81], [76, 83], [79, 86], [81, 88], [82, 89],
    [83, 90], [86, 93], [88, 95], [91, 98], [93, 100], [94, 101], [95, 102], [98, 105], [100, 107], [103, 110],
    [105, 112], [106, 113], [107, 114], [110, 117], [112, 119], [115, 122], [117, 124], [118, 125], [119, 126]
  ],
  minor0: [
    4, 7, 9, 10, 11, 14, 16, 19, 21, 22,
    23, 26, 28, 31, 33, 34, 35, 38, 40, 43,
    45, 46, 47, 50, 52, 55, 57, 58, 59, 62,
    64, 67, 69, 70, 71, 74, 76, 79, 81, 82,
    83, 86, 88, 91, 93, 94, 95, 98, 100, 103,
    105, 106, 107, 110, 112, 115, 117, 118, 119
  ],
  minor1: [
    11, 14, 16, 17, 18, 21, 23, 26, 28, 29,
    30, 33, 35, 38, 40, 41, 42, 45, 47, 50,
    52, 53, 54, 57, 59, 62, 64, 65, 66, 69,
    71, 74, 76, 77, 78, 81, 83, 86, 88, 89,
    90, 93, 95, 98, 100, 101, 102, 105, 107, 110,
    112, 113, 114, 117, 119, 122, 124, 125, 126
  ]
}
