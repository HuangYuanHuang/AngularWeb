using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using AngularWeb.Models;
namespace AngularWeb.Controllers
{
    public class CanvasController : Controller
    {
        // GET: Canvas
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        //[OutputCache(Duration = 6000)]
        public JsonResult List()
        {


            return Json(GetData());
        }

        private List<LineModel> GetData()
        {
            List<LineModel> list = new List<LineModel>();
            string[] arr = { "red", "#66ff99", "#0033cc", "#000066", "#00ff00" };
            Random rand = new Random();
            for (int d = 0; d < 5; d++)
            {
                var lineModel = new LineModel() { Color = arr[d], TagName = "位号" + d };
               
                for (int i = 0; i < 59; i++)
                {

                    lineModel.Data.Add(new LineDataNode()
                    {
                        Value = i * rand.Next(-10, 20),
                        Time = $"2016-10-19 08:{rand.Next(0, 60).ToString("D2")}:00"
                    });
                }

                lineModel.SetMinMaxValue();
                list.Add(lineModel);
            }


            return list;
        }
    }
}