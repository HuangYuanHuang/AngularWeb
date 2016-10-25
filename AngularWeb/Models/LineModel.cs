using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AngularWeb.Models
{
    public class LineModel
    {
        public string TagName { get; set; }

        public string Color { get; set; }

        public float MinValue { get; private set; }

        public float MaxValue { get; private set; }

        public List<LineDataNode> Data { get; set; } = new List<LineDataNode>();

        public void SetMinMaxValue()
        {
            if (Data.Count() > 0)
            {
                Data.Sort(new LineDataNode());
                MinValue = Data.Min(d => d.Value);
                MaxValue = Data.Max(d => d.Value);

                var temp =( MaxValue - MinValue) / 10;
                MinValue -= temp;
                MaxValue += temp;
            }
        }


    }

    public class LineDataNode : IComparer<LineDataNode>
    {
        public string Time { get; set; }

        public float Value { get; set; }

        public int Compare(LineDataNode x, LineDataNode y)
        {
            return DateTime.Parse(x.Time).CompareTo(DateTime.Parse(y.Time));
        }


    }
}